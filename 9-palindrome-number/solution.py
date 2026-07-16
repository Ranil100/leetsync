# Palindrome Number
# Difficulty: Easy
# Runtime: 14 ms
# Memory: 19.1 MB
# https://leetcode.com/problems/palindrome-number/

        # Step 1: Handle negative numbers immediately
        if x < 0:
            return False
            
        copy = x
        reversed_num = 0

        # Step 2: Reverse the integer using math
        while x > 0:
            remainder = x % 10
            reversed_num = (reversed_num * 10) + remainder
            x = x // 10  # Floor division to remove the last digit

        # Step 3: Compare
    def isPalindrome(self, x: int) -> bool:
class Solution:
