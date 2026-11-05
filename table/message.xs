// Durable transcript rows. Ownership is checked through the parent conversation.
table message {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int conversation_id {
      table = "conversation"
    }
    int user_id {
      table = "user"
    }
    enum role {
      values = ["user", "assistant"]
    }
    text content filters=trim|max:5000
    text intent? filters=trim
    text learning_stage? filters=trim
    int hint_level?
    json math_validation?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "conversation_id"}, {name: "created_at", op: "asc"}]}
    {type: "btree", field: [{name: "user_id"}, {name: "created_at", op: "desc"}]}
  ]
}
