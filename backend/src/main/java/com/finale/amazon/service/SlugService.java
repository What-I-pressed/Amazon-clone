package com.finale.amazon.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class SlugService {

    private static final String BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final Random random = new Random();

    public String generateRandomSlug(int length) {
        if (length < 1) length = 6;
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(BASE62.charAt(random.nextInt(BASE62.length())));
        }
        return sb.toString();
    }

    public String generateSeoSlug(String name, Long id) {
        if (name == null) name = "";
        String normalized = transliterate(name);
        // Lowercase
        normalized = normalized.toLowerCase();
        // Replace non alphanumeric with -
        normalized = normalized.replaceAll("[^a-z0-9]+", "-");
        // Trim -
        normalized = normalized.replaceAll("^-+", "").replaceAll("-+$", "");
        if (normalized.isEmpty()) {
            normalized = "item";
        }
        if (id != null) {
            normalized = normalized + "-" + id;
        }
        return normalized;
    }

    private static final Map<Character, String> CYR_MAP = new HashMap<>() {{
        put('А', "A"); put('Б', "B"); put('В', "V"); put('Г', "G"); put('Д', "D");
        put('Е', "E"); put('Ё', "E"); put('Ж', "Zh"); put('З', "Z"); put('И', "I");
        put('Й', "Y"); put('К', "K"); put('Л', "L"); put('М', "M"); put('Н', "N");
        put('О', "O"); put('П', "P"); put('Р', "R"); put('С', "S"); put('Т', "T");
        put('У', "U"); put('Ф', "F"); put('Х', "Kh"); put('Ц', "Ts"); put('Ч', "Ch");
        put('Ш', "Sh"); put('Щ', "Shch"); put('Ы', "Y"); put('Э', "E"); put('Ю', "Yu");
        put('Я', "Ya"); put('Ъ', ""); put('Ь', "");
        put('а', "a"); put('б', "b"); put('в', "v"); put('г', "g"); put('д', "d");
        put('е', "e"); put('ё', "e"); put('ж', "zh"); put('з', "z"); put('и', "i");
        put('й', "y"); put('к', "k"); put('л', "l"); put('м', "m"); put('н', "n");
        put('о', "o"); put('п', "p"); put('р', "r"); put('с', "s"); put('т', "t");
        put('у', "u"); put('ф', "f"); put('х', "kh"); put('ц', "ts"); put('ч', "ch");
        put('ш', "sh"); put('щ', "shch"); put('ы', "y"); put('э', "e"); put('ю', "yu");
        put('я', "ya"); put('ъ', ""); put('ь', "");
    }};

    private String transliterate(String input) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            String mapped = CYR_MAP.get(ch);
            if (mapped != null) {
                sb.append(mapped);
            } else {
                sb.append(ch);
            }
        }
        // Normalize and remove diacritics for Latin letters with accents
        String normalized = Normalizer.normalize(sb.toString(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized;
    }
}