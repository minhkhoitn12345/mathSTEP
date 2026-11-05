// Authenticated public gateway for the MathSTEP Python orchestrator.
// Configure MATHSTEP_INTERNAL_URL and MATHSTEP_SERVICE_TOKEN as Xano env vars before deployment.
query "chat-core" verb=POST {
  api_group = "TES"
  auth = "user"

  input {
    int conversation_id?
    text message filters=trim|min:1|max:4000
    text mode?="guided_learning"
    json learning_context
    json history?
    int hint_level?=1 filters=min:1|max:4
    json math_check?
  }

  stack {
    var $conversation {
      value = null
    }

    conditional {
      if ($input.conversation_id != null) {
        db.get conversation {
          field_name = "id"
          field_value = $input.conversation_id
        } as $existing_conversation

        precondition ($existing_conversation.user_id == $auth.id) {
          error_type = "accessdenied"
          error = "Conversation not found or access denied."
        }

        var.update $conversation {
          value = $existing_conversation
        }
      }
    }

    api.request {
      url = $env.MATHSTEP_INTERNAL_URL
      method = "POST"
      params = {
        conversation_id: $input.conversation_id|to_text
        message: $input.message
        mode: $input.mode
        learning_context: $input.learning_context
        history: $input.history ?? []
        hint_level: $input.hint_level
        math_check: $input.math_check
      }
      headers = [
        "Content-Type: application/json"
        "X-MathSTEP-Service-Key: " ~ $env.MATHSTEP_SERVICE_TOKEN
        "X-MathSTEP-Authenticated-User: " ~ ($auth.id|to_text)
      ]
      timeout = 55
    } as $ai_result

    precondition ($ai_result.response.status >= 200 && $ai_result.response.status < 300) {
      error_type = "standard"
      error = "MathSTEP AI service could not complete the request."
    }

    conditional {
      if ($conversation == null) {
        db.add conversation {
          data = {
            created_at: "now"
            updated_at: "now"
            user_id: $auth.id
            module: $input.learning_context.module
            title: $input.message
          }
        } as $new_conversation

        var.update $conversation {
          value = $new_conversation
        }
      }
    }

    db.add message {
      data = {
        conversation_id: $conversation.id
        user_id: $auth.id
        role: "user"
        content: $input.message
        learning_stage: $input.learning_context.learning_stage
      }
    } as $saved_user_message

    db.add message {
      data = {
        conversation_id: $conversation.id
        user_id: $auth.id
        role: "assistant"
        content: $ai_result.response.result.answer
        intent: $ai_result.response.result.intent
        learning_stage: $input.learning_context.learning_stage
        hint_level: $ai_result.response.result.hint_level
        math_validation: $ai_result.response.result.math_validation
      }
    } as $saved_assistant_message

    db.edit conversation {
      field_name = "id"
      field_value = $conversation.id
      data = {updated_at: "now"}
    } as $updated_conversation
  }

  response = {
    conversation_id: $conversation.id|to_text
    message_id: $saved_assistant_message.id|to_text
    answer: $ai_result.response.result.answer
    intent: $ai_result.response.result.intent
    mode: $ai_result.response.result.mode
    hint_level: $ai_result.response.result.hint_level
    citations: $ai_result.response.result.citations
    math_validation: $ai_result.response.result.math_validation
    next_action: $ai_result.response.result.next_action
    mascot: $ai_result.response.result.mascot
  }
}
