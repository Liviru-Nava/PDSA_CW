package com.example.pdsa_backend.dto.travelingsalesmandto;

import java.util.List;
import java.util.Map;

public class TSPRequest {
    private City homeCity;
    private List<City> selectedCities;
    private Map<Integer, Map<Integer, Integer>> distances;
    private int totalDistance;

    public static class City {
        private int id;
        private String name;

        //getters and setters for city class
        public int getId() {
            return id;
        }
        public void setId(int id) {
            this.id = id;
        }
        public String getName() {
            return name;
        }
        public void setName(String name) {
            this.name = name;
        }
    }

    //getters and setters for TSPRequest
    public City getHomeCity() {
        return homeCity;
    }
    public void setHomeCity(City homeCity) {
        this.homeCity = homeCity;
    }
    public List<City> getSelectedCities() {
        return selectedCities;
    }
    public void setSelectedCities(List<City> selectedCities) {
        this.selectedCities = selectedCities;
    }
    public Map<Integer, Map<Integer, Integer>> getDistances() {
        return distances;
    }
    public void setDistances(Map<Integer, Map<Integer, Integer>> distances) {
        this.distances = distances;
    }
    public int getTotalDistance() {
        return totalDistance;
    }
    public void setTotalDistance(int totalDistance) {
        this.totalDistance = totalDistance;
    }
}
