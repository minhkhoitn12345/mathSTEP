// Internal model gateway. The provider stays in Xano; the request secret is marked sensitive.
query "ai-complete" verb=POST {
  api_group = "TES"

  input {
    text service_key {
      sensitive = true
    }
    text prompt_context filters=max:20000
  }

  stack {
    precondition ($input.service_key == $env.MATHSTEP_SERVICE_TOKEN) {
      error_type = "accessdenied"
      error = "Internal service authentication failed."
    }

    ai.agent.run "MathSTEP Learning Agent" {
      args = {prompt_context: $input.prompt_context}
      allow_tool_execution = false
      version = "v5"
    } as $completion
  }

  response = $completion
}
