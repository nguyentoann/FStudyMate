package com.example.repository;

import com.example.model.OtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpEntity, Long> {
    
    /**
     * Find the latest OTP for a given email that hasn't been used
     */
    Optional<OtpEntity> findFirstByEmailAndUsedOrderByExpiryTimeDesc(String email, Boolean used);
    
    /**
     * Find an OTP by the actual OTP code and email
     */
    Optional<OtpEntity> findByOtpAndEmail(String otp, String email);
} 