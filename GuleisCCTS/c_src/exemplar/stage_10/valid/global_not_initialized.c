int foo;

int main() {
    for (int i = 0; i < 3; i = i + 1)
        foo = foo + 1;
    return foo;
}
// Example files from https://github.com/nlsandler/write_a_c_compiler
