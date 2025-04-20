package com.example.pdsa_backend.controller;

import com.example.pdsa_backend.data.Player;
import com.example.pdsa_backend.dto.TSPGameResult;
import com.example.pdsa_backend.dto.TSPRequest;
import com.example.pdsa_backend.dto.TSPResponse;
import com.example.pdsa_backend.service.TSPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TSPController {
    @Autowired
    private TSPService tspService;

    //check the username
    @GetMapping("/check")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        Map<String, Object> result = tspService.usernameExists(username);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register")
    public ResponseEntity<Player> registerPlayer(@RequestBody Player request) {
        Player player = tspService.registerPlayer(request.getUsername());
        return ResponseEntity.ok(player);
    }


    //solve the algorithm
    @PostMapping("/solve")
    public ResponseEntity<TSPResponse> solveTsp(@RequestBody TSPRequest request){
        TSPResponse solution = tspService.solveTSP(request);
        return ResponseEntity.ok(solution);
    }

    //save result to database
    @PostMapping("/save")
    public ResponseEntity<?> saveGameResult(@RequestBody TSPGameResult request){
        tspService.saveGameResult(request);
        return ResponseEntity.ok(Map.of("message", "Game Result saved successfully!"));
    }

}