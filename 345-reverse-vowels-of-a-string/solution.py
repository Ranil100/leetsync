# Reverse Vowels of a String
# Difficulty: Easy
# Runtime: 8 ms
# Memory: 20.8 MB
# https://leetcode.com/problems/reverse-vowels-of-a-string/

        while left < right:

            while left < right and s[left] not in vowels:
                left += 1

            while left < right and s[right] not in vowels:
                right -= 1

            s[left], s[right] = s[right], s[left]


        right = len(s) - 1
        left = 0

        s = list(s)

        vowels = "aeiouAEIOU"
