# Montagem e QA

1. Montar as sete seções sem movimento, com copy em HTML e imagens independentes.
2. Usar PNG com alpha da logo; não usar screenshots de Facebook como marca de produção. Para fundo escuro, colocar logo sobre placa clara ou azul, em vez de alterar a marca automaticamente.
3. Exportar AVIF/WebP responsivos na implementação mantendo PNGs originais. Preload apenas do hero; lazy-load abaixo da dobra.
4. Montar grão/cup-alpha em fundo separado ou usar o hero plano. Não duplicar contornos sobrepondo a xícara em outra posição.
5. Menu: rótulos e ingredientes em texto; SVGs separados são diagramas decorativos com descrição acessível no HTML. Não apresentar proporções como receitas do café.
6. O link conhecido é o site oficial. Confirmar a URL de menu/pedido e testar manualmente antes de trocar menu_href. Não implementar checkout fictício.
7. Conferir endereço e e-mail nos anexos; reconfirmar horários, preços, menu e fornecedor. Não usar fotos antigas para afirmar o estado atual exato.
8. A fachada tratada remove UI por geração/edição. Para uso documental definitivo, preferir arquivo original de fotografia fornecido pelo café.
9. Testar 360, 390, 768, 1440 e 1920px; teclado; foco; 200% zoom; reduced-motion; links; overflow; rede lenta.
10. Corpo com contraste mínimo 4.5:1. Opções do menu acionáveis por toque e teclado, nunca apenas hover. Recolher grupos sem animação quando movimento reduzido.

O estudo offline demonstra composição/timing 2D e não um vídeo do preparo. Revisão visual dele em navegador permanece indicada: o navegador headless não está instalado no ambiente.
