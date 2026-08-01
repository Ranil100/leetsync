# Happy Number
# Difficulty: Easy
# Runtime: 0 ms
# Memory: 19.3 MB
# https://leetcode.com/problems/happy-number/

    def isHappy(self, n: int) -> bool:
        seen = set()

        while n != 1 and n not in seen:
            seen.add(n)
            total = 0
            while n > 0:
                digit = n % 10
                total += digit * digit
                n //= 10
            n = total
class Solution:
