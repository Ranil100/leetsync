# Missing Number
# Difficulty: Easy
# Runtime: 3 ms
# Memory: 20.5 MB
# https://leetcode.com/problems/missing-number/

    def missingNumber(self, nums: list[int]) -> int:

        n= len(nums)
        s2 = (n * (n + 1)) / 2

        s1=0
        for i in range(n):
            s1+=nums[i]

        return int(s2-s1)    


class Solution:
