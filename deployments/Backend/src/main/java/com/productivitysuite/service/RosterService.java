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

    @Transactional(readOnly = true)
    public List<ShiftResponse> list(UUID userId) {
        return shiftRepo.findByUserIdOrderByShiftDateAsc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ShiftResponse create(UUID userId, ShiftRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        RosterShift shift = RosterShift.builder()
            .user(user).shiftDate(req.getDate()).startTime(req.getStartTime())
            .endTime(req.getEndTime()).shiftType(req.getShiftType()).notes(req.getNotes()).build();
        return toResponse(shiftRepo.save(shift));
    }

    public ShiftResponse update(UUID userId, UUID shiftId, ShiftRequest req) {
        RosterShift shift = shiftRepo.findByIdAndUserId(shiftId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Shift", shiftId));
        if (req.getDate() != null) shift.setShiftDate(req.getDate());
        if (req.getStartTime() != null) shift.setStartTime(req.getStartTime());
        if (req.getEndTime() != null) shift.setEndTime(req.getEndTime());
        if (req.getShiftType() != null) shift.setShiftType(req.getShiftType());
        shift.setNotes(req.getNotes());
        return toResponse(shiftRepo.save(shift));
    }

    public void delete(UUID userId, UUID shiftId) {
        shiftRepo.delete(shiftRepo.findByIdAndUserId(shiftId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Shift", shiftId)));
    }

    private ShiftResponse toResponse(RosterShift s) {
        return ShiftResponse.builder()
            .id(s.getId()).userId(s.getUser().getId()).date(s.getShiftDate())
            .startTime(s.getStartTime()).endTime(s.getEndTime())
            .shiftType(s.getShiftType()).notes(s.getNotes()).createdAt(s.getCreatedAt()).build();
    }
}
