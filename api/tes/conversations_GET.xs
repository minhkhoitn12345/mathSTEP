// Recent conversations belonging only to the authenticated user.
query conversations verb=GET {
  api_group = "TES"
  auth = "user"

  input {
    int page?=1 filters=min:1
    int per_page?=20 filters=min:1|max:50
  }

  stack {
    db.query conversation {
      where = $db.conversation.user_id == $auth.id
      sort = {updated_at: "desc"}
      return = {
        type: "list"
        paging: {page: $input.page, per_page: $input.per_page}
      }
    } as $conversations
  }

  response = $conversations
}
