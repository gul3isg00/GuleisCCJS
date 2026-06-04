int main() {
    int a = 0;
    {
        int b = 1;
        a = b;
    }
    {
        int b = 2;
        a = a + b;
    }
    return a;
}
// Example files from https://github.com/nlsandler/write_a_c_compiler
