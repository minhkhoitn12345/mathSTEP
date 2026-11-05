// Transcript retrieval verifies ownership before returning any message.
query "conversations/{conversation_id}" verb=GET {
  api_group = "TES"
  auth = "user"

  input {
    int conversation_id {
      table = "conversation"
    }
  }

  stack {
    db.get conversation {
      field_name = "id"
      field_value = $input.conversation_id
    } as $conversation

    precondition ($conversation != null && $conversation.user_id == $auth.id) {
      error_type = "notfound"
      error = "Conversation not found."
    }

    db.query message {
      where = $db.message.conversation_id == $conversation.id && $db.message.user_id == $auth.id
      sort = {created_at: "asc"}
      return = {type: "list", paging: {page: 1, per_page: 100}}
    } as $messages
  }

  response = {conversation: $conversation, messages: $messages.items}
}
