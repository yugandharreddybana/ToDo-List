package com.productivitysuite.service;

import com.productivitysuite.dto.roster.*;
import com.productivitysuite.entity.*;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RosterService {

    private final RosterShiftRepository shiftRepo;
    private final UserRepository userRepository;
    private final PlanningService events;

    @Transactional(readOnly = true)
    public List<ShiftResponse> list(UUID userId) {
        return shiftRepo.findByUserIdOrderByShiftDateAsc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ShiftResponse create(UUID userId, ShiftRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        RosterShift shift = RosterShift.builder()
            .user(user).shiftDate(req.getDate()).startTime(req.getStartTime())
            .endTime(req.getEndTime()).shiftType(req.getShiftType()).notes(req.getNotes()).location(req.getLocation()).build();
        RosterShift saved = shiftRepo.save(shift);
        events.record(userId, "roster.created", "roster_shift", saved.getId(), java.util.Map.of());
        return toResponse(saved);
    }

    public ShiftResponse update(UUID userId, UUID shiftId, ShiftRequest req) {
        RosterShift shift = shiftRepo.findByIdAndUserId(shiftId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Shift", shiftId));
        if (req.getDate() != null) shift.setShiftDate(req.getDate());
        if (req.getStartTime() != null) shift.setStartTime(req.getStartTime());
        if (req.getEndTime() != null) shift.setEndTime(req.getEndTime());
        if (req.getShiftType() != null) shift.setShiftType(req.getShiftType());
        shift.setNotes(req.getNotes());
        shift.setLocation(req.getLocation());
        RosterShift saved = shiftRepo.save(shift);
        events.record(userId, "roster.updated", "roster_shift", shiftId, java.util.Map.of());
        return toResponse(saved);
    }

    public void delete(UUID userId, UUID shiftId) {
        shiftRepo.delete(shiftRepo.findByIdAndUserId(shiftId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Shift", shiftId)));
        events.record(userId, "roster.deleted", "roster_shift", shiftId, java.util.Map.of());
    }

    private ShiftResponse toResponse(RosterShift s) {
        return ShiftResponse.builder()
            .id(s.getId()).userId(s.getUser().getId()).date(s.getShiftDate())
            .startTime(s.getStartTime()).endTime(s.getEndTime())
            .shiftType(s.getShiftType()).notes(s.getNotes()).location(s.getLocation()).createdAt(s.getCreatedAt()).build();
    }
}
