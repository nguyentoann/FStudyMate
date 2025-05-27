package test;

import model.User;

public class PhoneNumberTest {
    public static void main(String[] args) {
        // Test with phone number without leading 0
        User user1 = new User();
        user1.setPhoneNumber("1234567890");
        System.out.println("Phone without leading 0: 1234567890");
        System.out.println("After setter: " + user1.getPhoneNumber());
        
        // Test with phone number with leading 0
        User user2 = new User();
        user2.setPhoneNumber("01234567890");
        System.out.println("Phone with leading 0: 01234567890");
        System.out.println("After setter: " + user2.getPhoneNumber());
        
        // Test with null
        User user3 = new User();
        user3.setPhoneNumber(null);
        System.out.println("Phone with null: null");
        System.out.println("After setter: " + user3.getPhoneNumber());
        
        // Test with empty string
        User user4 = new User();
        user4.setPhoneNumber("");
        System.out.println("Phone with empty string: \"\"");
        System.out.println("After setter: " + user4.getPhoneNumber());
    }
} 