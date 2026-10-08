# Roteiro de movimento / From bean to morning

## Hero desktop
Trecho de 220svh com palco sticky de 100svh; conteúdo e CTA disponíveis desde a primeira tela. Não usar intro bloqueante. Progresso reversível por scroll nativo.

| Progresso | Acontecimento | Técnica em camadas |
|---|---|---|
| 0–0.18 | Luz percorre a fenda do grão. | Macro em escala 1.12→1.05; linha SVG curta desenha o eixo. |
| 0.18–0.40 | Fenda abre uma janela arredondada para a xícara. | Match cut e máscara elíptica, crossfade; não morphar o grão fisicamente. |
| 0.40–0.60 | Xícara revela latte art, plano de madeira recua. | Cup-alpha com paralaxe até 24px; hero estático atrás. |
| 0.60–0.84 | Círculo da xícara vira quatro diagramas de bebidas. | Crossfade para vetores; grupos de líquido se separam em 8–18px. |
| 0.84–1 | Diagramas encontram o grid do menu. | Handoff para seção em fluxo, com rótulos e links HTML. |

A imagem principal mostra leite entrando no latte, não espresso derramado sobre latte art pronta. No estudo 2D, o fio ilustrado representa apenas uma transição gráfica; não animar o conteúdo do PNG como se fosse um filme de preparo real.

## Produção cinematográfica opcional
Se desejar câmera orbitando a xícara, extração real e líquido em movimento contínuo, produzir filme ou cena 3D específica: grão macro → extração do espresso → leite formando a rosetta → match cut de topo para menu. Mesma câmera e iluminação entre shots; simular líquido com gravidade, não usar interpolação que deforma alça ou espuma. Esses frames extras não fazem parte do kit estático.

## Seções
Menu: foco ou hover revela legenda e separa camadas; toque escolhe a bebida, sem depender de hover. Ingredientes dos diagramas são esquemáticos; não mostram a receita ou proporção exata do Bloom.
Comida: revelar por máscara simples e mostrar o item inteiro. Sem comida gigante flutuando sobre clientes reais.
Our corner: usar fachada real tratada com legenda e comparação ao original; entrada com fade de 400ms.
Contato: linha do fluxo termina no CTA Get directions. Sem áudio automático.

## Mobile e reduced-motion
No máximo 140–150svh para macro→xícara; menu no fluxo sem pin. Escolha por botões grandes, mínimo 44px. prefers-reduced-motion: hero estático, grupos líquidos reunidos e conteúdos visíveis. Sem scroll travado.

## Limites das camadas
Recortes não substituem modelos 3D. Usar cup-alpha em fundo novo ou hero plano; não sobrepor à xícara original desalinhada. O macro e o grão recortado são enquadramentos distintos; crossfade e máscara fazem a passagem, não uma falsa rotação perfeita.
