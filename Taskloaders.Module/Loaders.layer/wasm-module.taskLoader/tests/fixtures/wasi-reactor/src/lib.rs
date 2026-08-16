//! Fixture de teste: módulo WASI no modo `reactor`.
//!
//! Compilado para `wasm32-wasip1`. Só existe para provar que o loader instancia
//! um módulo com a ABI do WASI, chama `_initialize` e devolve exports vivos —
//! o que um `.wasmlib` de ABI `core` não consegue demonstrar.
//!
//! `count_args` toca a biblioteca padrão de propósito: ler os argumentos do
//! processo obriga o módulo a importar `wasi_snapshot_preview1`, que é o que
//! diferencia esta ABI da `core`.

#[no_mangle]
pub extern "C" fn triple(value: i32) -> i32 {
    value.wrapping_mul(3)
}

#[no_mangle]
pub extern "C" fn count_args() -> i32 {
    std::env::args().count() as i32
}
