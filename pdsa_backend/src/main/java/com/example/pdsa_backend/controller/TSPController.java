package com.example.pdsa_backend.controller;

import com.example.pdsa_backend.dto.TSPRequest;
import com.example.pdsa_backend.dto.TSPResponse;
import com.example.pdsa_backend.service.TSPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TSPController {
    @Autowired
    private TSPService tspService;

    @PostMapping("/solve")
    public ResponseEntity<TSPResponse> solveTsp(@RequestBody TSPRequest request){
        TSPResponse solution = tspService.solveTSP(request);
        return ResponseEntity.ok(solution);
    }
}