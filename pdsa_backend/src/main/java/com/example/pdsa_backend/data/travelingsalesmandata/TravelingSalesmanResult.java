package com.example.pdsa_backend.data.travelingsalesmandata;

import jakarta.persistence.*;

@Entity
@Table(name="travelingsalesmanresult")
public class TravelingSalesmanResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="tsp_result_id")
    private int tspResultId;
    @Column(name="result_id")
    private int resultId;
    @Column(name="home_city")
    private String homeCity;
    @Column(name="shortest_route")
    private String shortestRoute;
    @Column(name="shortest_distance")
    private int shortestDistance;

    //getters and setters
    public int getTspResultId() {
        return tspResultId;
    }

    public void setTspResultId(int tspResultId) {
        this.tspResultId = tspResultId;
    }

    public int getResultId() {
        return resultId;
    }

    public void setResultId(int resultId) {
        this.resultId = resultId;
    }

    public String getHomeCity() {
        return homeCity;
    }

    public void setHomeCity(String homeCity) {
        this.homeCity = homeCity;
    }

    public String getShortestRoute() {
        return shortestRoute;
    }

    public void setShortestRoute(String shortestRoute) {
        this.shortestRoute = shortestRoute;
    }

    public int getShortestDistance() {
        return shortestDistance;
    }

    public void setShortestDistance(int shortestDistance) {
        this.shortestDistance = shortestDistance;
    }
}
