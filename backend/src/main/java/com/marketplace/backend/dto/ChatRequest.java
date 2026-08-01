package com.marketplace.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class ChatRequest {
    @NotBlank
    private String message;
    private List<ChatMessageDto> history;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<ChatMessageDto> getHistory() { return history; }
    public void setHistory(List<ChatMessageDto> history) { this.history = history; }
}
