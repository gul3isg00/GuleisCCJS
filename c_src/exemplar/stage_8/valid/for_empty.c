int main() {
    int a = 0;
    for (; ; ) {
        a = a + 1;
        if (a > 3)
            break;
    }

    return a;
}
// Example files from https://github.com/nlsandler/write_a_c_compiler
