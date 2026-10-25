package com.productivitysuite.controller;

import com.productivitysuite.entity.AIConversation;
import com.productivitysuite.entity.User;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.AIConversationRepository;
import com.productivitysuite.repository.UserRepository;
import com.productivitysuite.service.PlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/ai/conversations")
@RequiredArgsConstructor
public class AIConversationController {
    private final AIConversationRepository conversations;
    private final UserRepository users;
    private final PlanningService events;

    public record ConversationResponse(UUID id, String title, List<Map<String, Object>> messages, Instant createdAt, Instant updatedAt) {}
    public record ConversationRequest(String title, List<Map<String, Object>> messages) {}

    @GetMapping
    public List<ConversationResponse> list(@AuthenticationPrincipal UserDetails principal) {
        return conversations.findByUserIdOrderByUpdatedAtDesc(uid(principal)).stream().map(this::response).toList();
    }

    @GetMapping("/{id}")
    public ConversationResponse get(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id) {
        return response(owned(uid(principal), id));
    }

    @PostMapping
    public ResponseEntity<ConversationResponse> create(@AuthenticationPrincipal UserDetails principal, @RequestBody ConversationRequest request) {
        validate(request);
        UUID userId = uid(principal);
        User user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        AIConversation saved = conversations.save(AIConversation.builder().user(user).title(request.title()).messages(request.messages()).build());
        events.record(userId, "ai.conversation.created", "ai_conversation", saved.getId(), Map.of());
        return ResponseEntity.status(HttpStatus.CREATED).body(response(saved));
    }

    @PutMapping("/{id}")
    public ConversationResponse update(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id, @RequestBody ConversationRequest request) {
        validate(request);
        AIConversation conversation = owned(uid(principal), id);
        conversation.setTitle(request.title());
        conversation.setMessages(request.messages());
        conversation.setUpdatedAt(Instant.now());
        events.record(uid(principal), "ai.conversation.updated", "ai_conversation", id, Map.of());
        return response(conversations.save(conversation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id) {
        conversations.delete(owned(uid(principal), id));
        events.record(uid(principal), "ai.conversation.deleted", "ai_conversation", id, Map.of());
        return ResponseEntity.noContent().build();
    }

    private void validate(ConversationRequest request) {
        if (request.messages() == null || request.messages().size() > 100 || request.title() != null && request.title().length() > 200)
            throw new IllegalArgumentException("Invalid conversation");
        for (Map<String, Object> message : request.messages()) {
            if (!(message.get("role") instanceof String role) || !(role.equals("user") || role.equals("assistant")) || !(message.get("content") instanceof String content) || content.length() > 8000)
                throw new IllegalArgumentException("Invalid conversation message");
        }
    }

    private AIConversation owned(UUID userId, UUID id) {
        return conversations.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("AI conversation", id));
    }
    private ConversationResponse response(AIConversation conversation) {
        return new ConversationResponse(conversation.getId(), conversation.getTitle(), conversation.getMessages(), conversation.getCreatedAt(), conversation.getUpdatedAt());
    }
    private UUID uid(UserDetails principal) { return UUID.fromString(principal.getUsername()); }
}
