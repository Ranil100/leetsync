# Find the Index of the First Occurrence in a String
# Difficulty: Easy
# Runtime: 0 ms
# Memory: 19.2 MB
# https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/

class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        k = len(haystack) - len(needle)

        for i in range(k+1):
            if haystack[i : i + len(needle)] == needle:
                return i
        return -1
