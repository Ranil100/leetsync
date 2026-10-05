# Valid Anagram
# Difficulty: Easy
# Runtime: 14 ms
# Memory: 19.5 MB
# https://leetcode.com/problems/valid-anagram/

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:

        if len(s) != len(t):
            return False

        count = {}

        for ch in s:
            if ch in count:
                count[ch] += 1
            else:
                count[ch] = 1

        for ch in t:
            if ch in count:
