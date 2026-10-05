# Valid Palindrome
# Difficulty: Easy
# Runtime: 7 ms
# Memory: 19.5 MB
# https://leetcode.com/problems/valid-palindrome/

            while left < right and not s[left].isalnum():
                left += 1

            while left < right and not s[right].isalnum():
                right -= 1

            if s[left].lower() != s[right].lower():
                return False

            left += 1
            right -= 1

        return True  
