# Two Sum
# Difficulty: Easy
# Runtime: 1723 ms
# Memory: 19.7 MB
# https://leetcode.com/problems/two-sum/

class Solution:
    def twoSum(self, nums, target):

        for i in range(len(nums)):

            for j in range(i + 1, len(nums)):

                if nums[i] + nums[j] == target:
                    return [i, j]

        return [-1, -1]
