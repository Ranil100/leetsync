# Sqrt(x)
# Difficulty: Easy
# Runtime: 3 ms
# Memory: 19.1 MB
# https://leetcode.com/problems/sqrtx/

class Solution(object):
    def mySqrt(self, x):
        if x == 0:
            return 0
        left, right = 1, x
        while left <= right:
            mid = (left + right) // 2
            if mid * mid == x:
                return mid
            elif mid * mid < x:
                left = mid + 1
            else:
                right = mid - 1
        return right
