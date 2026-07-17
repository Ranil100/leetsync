# Power of Three
# Difficulty: Easy
# Runtime: 31 ms
# Memory: 19.2 MB
# https://leetcode.com/problems/power-of-three/

import math

class Solution:
    def isPowerOfThree(self, n: int) -> bool:
        if n == 0:
            return False

        # 3^19 is 1,162,261,467 (fits under the 2^31 - 1 limit)
        for i in range(20):
            if 3 ** i == n:
                return True
                
        return False         
