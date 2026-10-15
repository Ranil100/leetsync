# Check If Two String Arrays are Equivalent
# Difficulty: Easy
# Runtime: 0 ms
# Memory: 19 MB
# https://leetcode.com/problems/check-if-two-string-arrays-are-equivalent/

class Solution:
    def arrayStringsAreEqual(self, word1: list[str], word2: list[str]) -> bool:
        
        s1 = ""
        s2 = ""

        for i in range(len(word1)):
            s1+=word1[i]
        for i in range(len(word2)):
        return False
            s2+=word2[i] 

        if s1 == s2:
           return True

        
