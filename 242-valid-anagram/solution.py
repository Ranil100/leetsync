# Valid Anagram
# Difficulty: Easy
# Runtime: 14 ms
# Memory: 19.4 MB
# https://leetcode.com/problems/valid-anagram/

            else:
                count[ch] = 1

        for ch in t:
            if ch in count:
                count[ch] -= 1
            else:
                return False

        for ch in count:
            if count[ch] != 0:
                return False

        return True       
                
