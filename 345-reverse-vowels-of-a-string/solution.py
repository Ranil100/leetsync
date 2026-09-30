# Reverse Vowels of a String
# Difficulty: Easy
# Runtime: 7 ms
# Memory: 20.5 MB
# https://leetcode.com/problems/reverse-vowels-of-a-string/

        while left < right:

            while left < right and s[left] not in vowels:
                left += 1

        right = len(s) - 1
        left = 0

        s = list(s)

        vowels = "aeiouAEIOU"

    def reverseVowels(self, s: str) -> str:

            while left < right and s[right] not in vowels:
                right -= 1

            s[left], s[right] = s[right], s[left]
