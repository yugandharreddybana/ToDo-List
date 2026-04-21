package com.productivitysuite.service;

import com.productivitysuite.dto.career.*;
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
public class CareerService {

    private final CareerApplicationRepository appRepo;
    private final CareerContactRepository contactRepo;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ApplicationResponse> listApplications(UUID userId) {
        return appRepo.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toAppResponse).collect(Collectors.toList());
    }

    public ApplicationResponse createApplication(UUID userId, ApplicationRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        CareerApplication app = CareerApplication.builder()
            .user(user).company(req.getCompany()).role(req.getRole())
            .status(req.getStatus()).appliedDate(req.getAppliedDate())
            .salaryMin(req.getSalaryMin()).salaryMax(req.getSalaryMax())
            .currency(req.getCurrency() == null ? "USD" : req.getCurrency())
            .url(req.getUrl()).notes(req.getNotes())
            .contactName(req.getContactName()).contactEmail(req.getContactEmail())
            .nextFollowUp(req.getNextFollowUp()).build();
        return toAppResponse(appRepo.save(app));
    }

    public ApplicationResponse updateApplication(UUID userId, UUID appId, ApplicationRequest req) {
        CareerApplication app = appRepo.findByIdAndUserId(appId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", appId));
        if (req.getCompany() != null) app.setCompany(req.getCompany());
        if (req.getRole() != null) app.setRole(req.getRole());
        if (req.getStatus() != null) app.setStatus(req.getStatus());
        if (req.getAppliedDate() != null) app.setAppliedDate(req.getAppliedDate());
        if (req.getSalaryMin() != null) app.setSalaryMin(req.getSalaryMin());
        if (req.getSalaryMax() != null) app.setSalaryMax(req.getSalaryMax());
        if (req.getUrl() != null) app.setUrl(req.getUrl());
        if (req.getNotes() != null) app.setNotes(req.getNotes());
        if (req.getContactName() != null) app.setContactName(req.getContactName());
        if (req.getContactEmail() != null) app.setContactEmail(req.getContactEmail());
        if (req.getNextFollowUp() != null) app.setNextFollowUp(req.getNextFollowUp());
        return toAppResponse(appRepo.save(app));
    }

    public void deleteApplication(UUID userId, UUID appId) {
        appRepo.delete(appRepo.findByIdAndUserId(appId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", appId)));
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> listContacts(UUID userId) {
        return contactRepo.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toContactResponse).collect(Collectors.toList());
    }

    public ContactResponse createContact(UUID userId, ContactRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        CareerApplication app = req.getApplicationId() == null ? null :
            appRepo.findByIdAndUserId(req.getApplicationId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", req.getApplicationId()));
        CareerContact contact = CareerContact.builder()
            .user(user).application(app).name(req.getName())
            .email(req.getEmail()).linkedinUrl(req.getLinkedinUrl())
            .role(req.getRole()).notes(req.getNotes()).build();
        return toContactResponse(contactRepo.save(contact));
    }

    private ApplicationResponse toAppResponse(CareerApplication a) {
        return ApplicationResponse.builder()
            .id(a.getId()).userId(a.getUser().getId()).company(a.getCompany())
            .role(a.getRole()).status(a.getStatus()).appliedDate(a.getAppliedDate())
            .salaryMin(a.getSalaryMin()).salaryMax(a.getSalaryMax()).currency(a.getCurrency())
            .url(a.getUrl()).notes(a.getNotes()).contactName(a.getContactName())
            .contactEmail(a.getContactEmail()).nextFollowUp(a.getNextFollowUp())
            .createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt()).build();
    }

    private ContactResponse toContactResponse(CareerContact c) {
        return ContactResponse.builder()
            .id(c.getId()).userId(c.getUser().getId())
            .applicationId(c.getApplication() == null ? null : c.getApplication().getId())
            .name(c.getName()).email(c.getEmail()).linkedinUrl(c.getLinkedinUrl())
            .role(c.getRole()).notes(c.getNotes()).createdAt(c.getCreatedAt()).build();
    }
}
