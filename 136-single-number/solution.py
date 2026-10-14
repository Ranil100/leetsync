# Single Number
# Difficulty: Easy
# Runtime: 10 ms
# Memory: 21.5 MB
# https://leetcode.com/problems/single-number/

class Solution:
    def singleNumber(self, nums: list[int]) -> int:

        count = {}

        for num in nums:

            if num in count:
                count[num]+=1
            else:
                count[num] = 1

        for num in nums:        

            if count[num] == 1:
                return num            
