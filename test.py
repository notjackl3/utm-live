def evalRPN(tokens: list[str]) -> int:
    def calculate(num1, exp, num2):
        if exp == "+":
            return num1 + num2
        elif exp == "-":
            return num1 - num2
        elif exp == "*":
            return num1 * num2
        else:
            return int(num1 / num2)
            

    temp_nums = []
    for token in tokens:
        print(temp_nums)
        if token not in ["+", "-", "*", "/"]:
            temp_nums.append(token)
        else:
            num2 = int(temp_nums.pop())
            num1 = int(temp_nums.pop())
            print(token)
            temp_nums.append(calculate(num1, token, num2))
    if temp_nums:
        return int(temp_nums[0])
    return int(tokens[0])


print(evalRPN(["4","13","5","/","+"]))