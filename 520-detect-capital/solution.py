# Detect Capital
# Difficulty: Easy
# Runtime: 0 ms
# Memory: 19.2 MB
# https://leetcode.com/problems/detect-capital/

        k = 0

        for i in range(len(word)):
            if word[i].isupper():
                c += 1

            if word[i].islower():
                k += 1

        if c == len(word) or k == len(word):
            return True

        if c == 1 and word[0].isupper():
            return True
        else:
            return False
        
