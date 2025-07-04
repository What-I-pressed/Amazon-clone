package com.finale.amazon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;

@SpringBootApplication
public class AmazonApplication {

	public static void main(String[] args) {
		SpringApplication.run(AmazonApplication.class, args);
	}

	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
			.info(new Info()
				.title("Amazon Clone API")
				.version("1.0")
				.description("API for Amazon Clone application")
				.contact(new Contact()
					.name("Naah uh")
					.email("Naahuh@naahuh.com")))
			.components(new Components()
				.addSecuritySchemes("bearerAuth", 
					new SecurityScheme()
						.type(SecurityScheme.Type.HTTP)
						.scheme("bearer")
						.bearerFormat("JWT")
						.description("Enter JWT token")))
			.addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
	}
}
