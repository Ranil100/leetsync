# Missing Number
# Difficulty: Easy
# Runtime: 3 ms
# Memory: 20.2 MB
# https://leetcode.com/problems/missing-number/

class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        n = len(nums)
        expected_sum = n * (n + 1) // 2

        actual_sum = 0 
        for i in range(n):
           actual_sum+=nums[i]
        
        return expected_sum - actual_sum
