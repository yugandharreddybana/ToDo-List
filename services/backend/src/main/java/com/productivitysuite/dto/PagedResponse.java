package com.productivitysuite.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Data
@Builder
public class PagedResponse<T> {
    private List<T> items;
    private int page;
    private int limit;
    private long total;
    private int totalPages;

    public static <S, T> PagedResponse<T> from(Page<S> page, Function<S, T> mapper) {
        return PagedResponse.<T>builder()
            .items(page.getContent().stream().map(mapper).collect(Collectors.toList()))
            .page(page.getNumber() + 1)
            .limit(page.getSize())
            .total(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .build();
    }
}
