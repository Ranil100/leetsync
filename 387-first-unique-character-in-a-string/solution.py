# First Unique Character in a String
# Difficulty: Easy
# Runtime: 88 ms
# Memory: 19.6 MB
# https://leetcode.com/problems/first-unique-character-in-a-string/


        count = {}

        for i in range(len(s)):
            if s[i] in count:
                count[s[i]] += 1
            else:
                count[s[i]] = 1

        for i in range(len(s)):
            if count[s[i]] == 1:
                return i

        return -1  

