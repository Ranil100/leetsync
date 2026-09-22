# Squares of a Sorted Array
# Difficulty: Easy
# Runtime: 11 ms
# Memory: 21.3 MB
# https://leetcode.com/problems/squares-of-a-sorted-array/

class Solution:
    def sortedSquares(self, nums: list[int]) -> list[int]:

        new_list = []

        for i in range(0,len(nums)):

            new_list.append(nums[i] * nums[i])

        new_list.sort()    

        return new_list
        
