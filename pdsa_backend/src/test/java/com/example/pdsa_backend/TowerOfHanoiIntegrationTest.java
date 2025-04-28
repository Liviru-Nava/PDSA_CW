package com.example.pdsa_backend;

import com.example.pdsa_backend.controller.tohcontroller.TohController;
import com.example.pdsa_backend.dto.towerofhanoidto.AutoSolveRequest;
import com.example.pdsa_backend.dto.towerofhanoidto.TowerOfHanoiRequest;
import com.example.pdsa_backend.service.tohservice.TowerOfHanoiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TowerOfHanoiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TohController tohController;

    @Autowired
    private TowerOfHanoiService towerOfHanoiService;

    @Test
    public void testSubmitSolution() throws Exception {
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("integrationTestUser");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(31);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C,A→B,C→B,C→A,B→A,C→B,A→C,A→B,C→B,A→C,B→A,B→C,A→C,B→A,C→B,C→A,B→A,B→C,A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        mockMvc.perform(MockMvcRequestBuilders.post("/tower-of-hanoi/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.message").value("Solution submitted successfully!"));
    }

    @Test
    public void testGetAutoSolveSequence() throws Exception {
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(5);
        request.setPegCount(3);

        mockMvc.perform(MockMvcRequestBuilders.post("/tower-of-hanoi/auto-solve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.numOfMoves").value(31));
    }

    @Test
    public void testGetPerformanceMetrics() throws Exception {
        // First populate some test data
        mockMvc.perform(MockMvcRequestBuilders.post("/tower-of-hanoi/test-populate-metrics"))
                .andExpect(status().isOk());

        // Then retrieve metrics
        mockMvc.perform(MockMvcRequestBuilders.get("/tower-of-hanoi/performance-metrics")
                        .param("rounds", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionTimes").exists())
                .andExpect(jsonPath("$.complexityAnalysis").exists());
    }

    @Test
    public void testInvalidSubmitSolution() throws Exception {
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(31);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        mockMvc.perform(MockMvcRequestBuilders.post("/tower-of-hanoi/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.message").value("Username is required."));
    }

    @Test
    public void testInvalidGetPerformanceMetrics() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/tower-of-hanoi/performance-metrics")
                        .param("rounds", "-1"))
                .andExpect(status().isBadRequest());
    }
}
