// TES math tutor chat endpoint
query chat verb=POST {
  api_group = "TES"

  input {
    // Tên mô hình AI được yêu cầu từ client (tùy chọn)
    text model?
  
    // Danh sách các lượt hội thoại theo cấu trúc [{"role": "...", "content": "..."}]
    json messages?
  
    // Đối số dự phòng hỗ trợ tương thích ngược nếu payload được bọc trong trường args
    json args?
  }

  stack {
    // Trích xuất danh sách hội thoại từ trường messages cấp cao nhất hoặc từ args
    var $messages {
      value = $input.messages ?? $input.args.messages
    }
  
    // Kiểm tra input bắt buộc: messages không được rỗng
    precondition ($messages != null && ($messages|is_empty) == false) {
      error_type = "inputerror"
      error = "Thiếu trường 'messages' hoặc danh sách hội thoại đang trống."
    }
  
    // Chuyển đổi sang mảng/đối tượng nếu messages được truyền dưới dạng chuỗi JSON
    conditional {
      if ($messages|is_text) {
        var.update $messages {
          value = $messages|json_decode
        }
      }
    }
  
    // Gọi Agent TES - Gia sư Toán với dynamic input messages
    ai.agent.run "TES – Gia sư Toán" {
      args = {messages: $messages}
      allow_tool_execution = true
      version = "v5"
    } as $agent_response
  
    // Khởi tạo biến lưu câu trả lời của Agent
    var $answer {
      value = ""
    }
  
    // Trích xuất nội dung câu trả lời dạng chuỗi từ kết quả Agent
    conditional {
      if ($agent_response|is_text) {
        var.update $answer {
          value = $agent_response
        }
      }
    
      elseif (($agent_response.response|is_text) && ($agent_response.response|is_empty) == false) {
        var.update $answer {
          value = $agent_response.response
        }
      }
    
      elseif (($agent_response.result|is_text) && ($agent_response.result|is_empty) == false) {
        var.update $answer {
          value = $agent_response.result
        }
      }
    
      elseif (($agent_response.answer|is_text) && ($agent_response.answer|is_empty) == false) {
        var.update $answer {
          value = $agent_response.answer
        }
      }
    
      elseif (($agent_response.text|is_text) && ($agent_response.text|is_empty) == false) {
        var.update $answer {
          value = $agent_response.text
        }
      }
    
      elseif ($agent_response != null) {
        var.update $answer {
          value = $agent_response|to_text
        }
      }
    }
  
    // Chuẩn hóa và làm sạch chuỗi câu trả lời
    var.update $answer {
      value = $answer|to_text|trim
    }
  
    // Kiểm tra câu trả lời trả về từ Agent
    precondition (($answer|strlen) > 0) {
      error = "Agent không trả về câu trả lời."
    }
  }

  response = {answer: $answer}

  test "TES Math Chat Request" {
    input = {
      model   : "gemini-2.5-flash"
      messages: ```
        [
          {
            role: "system",
            content: "Bạn là TES, gia sư Toán THPT bằng tiếng Việt."
          },
          {
            role: "user",
            content: "Giải phương trình bậc hai: x^2 - 5x + 6 = 0"
          }
        ]
        ```
    }
  }

  guid = "izY9q4GLtyPioaTgwloqslfazlI"
}