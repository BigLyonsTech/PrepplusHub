package com.marketplace.backend.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.errors.AnthropicException;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.marketplace.backend.dto.ChatMessageDto;
import com.marketplace.backend.dto.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final int MAX_HISTORY_TURNS = 10;

    private static final String SYSTEM_PROMPT = """
            You are the support assistant for PrepplusHub, a multi-vendor e-commerce marketplace \
            operated by Prepplus Global Limited. You help visitors, customers, and vendors with \
            questions about using the platform.

            Key facts about how PrepplusHub works:
            - Anyone can browse products without an account.
            - Buying or selling requires registering with KYC details (name, ID document, address) \
            and verifying an email via a 6-digit OTP code.
            - After verifying, a user chooses to continue as a Customer or a Vendor.
            - Customers take a short personalization quiz (interests, budget, shopping style) and \
            land on a "For You" feed.
            - Vendors submit a business-eligibility form (business name, category, expected product \
            range, ID documents) and wait for admin review before they can list products or access \
            payouts. Status is one of: not yet submitted, pending, verified, or rejected (with a \
            reason shown to the vendor, who can then update and resubmit).
            - Checkout is a simple delivery-address -> payment -> review flow.
            - Customers can rate both individual products and vendors.

            Answer concisely and only about PrepplusHub itself. If asked something you don't know \
            or that requires looking at the user's actual account (e.g. "why was I rejected"), tell \
            them to check their dashboard or contact support directly rather than guessing.
            """;

    private final AnthropicClient client;
    private final String model;

    public ChatService(
            @Value("${anthropic.api-key:}") String apiKey,
            @Value("${anthropic.model:claude-opus-5}") String model
    ) {
        this.model = model;
        this.client = apiKey.isBlank() ? null : AnthropicOkHttpClient.builder().apiKey(apiKey).build();
    }

    public String reply(ChatRequest request) {
        if (client == null) {
            return "Chat support isn't configured yet. Please try again later.";
        }

        MessageCreateParams.Builder params = MessageCreateParams.builder()
                .model(model)
                .maxTokens(1024)
                .addSystemMessage(SYSTEM_PROMPT);

        List<ChatMessageDto> history = request.getHistory();
        if (history != null) {
            int start = Math.max(0, history.size() - MAX_HISTORY_TURNS);
            for (ChatMessageDto turn : history.subList(start, history.size())) {
                if (turn.getContent() == null || turn.getContent().isBlank()) continue;
                if ("assistant".equals(turn.getRole())) {
                    params.addAssistantMessage(turn.getContent());
                } else {
                    params.addUserMessage(turn.getContent());
                }
            }
        }
        params.addUserMessage(request.getMessage());

        try {
            Message message = client.messages().create(params.build());
            return message.content().stream()
                    .filter(block -> block.text().isPresent())
                    .findFirst()
                    .map(block -> block.asText().text())
                    .orElse("Sorry, I couldn't come up with a response. Please try again.");
        } catch (AnthropicException e) {
            log.error("Chat request to Claude failed", e);
            return "Sorry, support chat is temporarily unavailable. Please try again shortly.";
        }
    }
}
