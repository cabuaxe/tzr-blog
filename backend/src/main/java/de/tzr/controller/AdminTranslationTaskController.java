package de.tzr.controller;

import de.tzr.dto.TranslationTaskDTO;
import de.tzr.service.TranslationTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/translations/tasks")
@RequiredArgsConstructor
public class AdminTranslationTaskController {

    private final TranslationTaskService translationTaskService;

    @GetMapping
    public List<TranslationTaskDTO> getAll(@RequestParam(required = false) String status) {
        if ("PENDING".equalsIgnoreCase(status)) {
            return translationTaskService.getPendingTasks();
        }
        return translationTaskService.getAllTasks();
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return translationTaskService.getStats();
    }

    @PatchMapping("/{id}/status")
    public TranslationTaskDTO updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return translationTaskService.updateStatus(id, body.get("status"));
    }
}
