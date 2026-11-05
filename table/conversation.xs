// Persistent, per-user conversation headers for the MathSTEP chat.
table conversation {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?=now
    int user_id {
      table = "user"
    }
    text module filters=trim
    text title? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}, {name: "updated_at", op: "desc"}]}
  ]
}
