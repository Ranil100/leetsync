# Add Digits
# Difficulty: Easy
# Runtime: 2 ms
# Memory: 19.3 MB
# https://leetcode.com/problems/add-digits/

class Solution:
    def addDigits(self, num: int) -> int:
        while num > 9:
            digit_sum = 0
            while num > 0:
                digit_sum += num % 10
                num //= 10
            num = digit_sum  # Set num to the new sum and repeat if it's still > 9
            
        return num
        
