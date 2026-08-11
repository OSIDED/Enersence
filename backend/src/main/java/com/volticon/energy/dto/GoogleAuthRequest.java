package com.volticon.energy.dto;

public class GoogleAuthRequest {
    private String email;
    private String fullName;

    public GoogleAuthRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}
