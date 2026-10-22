
package com.example.auth.login;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginLogoutSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    void setUp() {
        System.setProperty(
                "webdriver.chrome.driver",
                "D:\\Hadleen\\chromedriver\\chromedriver-win64\\chromedriver.exe"
        );

        driver = new ChromeDriver();
        driver.manage().window().maximize();

        wait = new WebDriverWait(
                driver, Duration.ofSeconds(15)
        );
    }

    @Test
    void loginAndLogoutTest() {

        driver.get("http://localhost:5173/");

        // Enter login credentials
        driver.findElement(By.name("identifier"))
                .sendKeys("arun123");

        driver.findElement(By.name("password"))
                .sendKeys("TestPass123!");

        // Sign in
        driver.findElement(By.cssSelector("button.sign-in"))
                .click();

        // Verify dashboard
        wait.until(d ->
                d.getCurrentUrl().contains("/dashboard")
        );

        assertTrue(
                driver.getCurrentUrl().contains("/dashboard"),
                "Dashboard should open after login"
        );

        // Click Logout
        By logout = By.xpath(
                "//button[normalize-space()='Logout']"
        );

        wait.until(d -> d.findElement(logout).isDisplayed());
        driver.findElement(logout).click();

        // Verify return to login page
        wait.until(d ->
                !d.getCurrentUrl().contains("/dashboard")
        );

        wait.until(d ->
                d.findElement(By.name("identifier")).isDisplayed()
        );

        assertTrue(
                driver.getCurrentUrl().equals("http://localhost:5173/")
                        || driver.getCurrentUrl().equals("http://localhost:5173"),
                "Login page should appear after logout"
        );
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
