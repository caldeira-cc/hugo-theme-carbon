---
title: "Mathematical Typesetting & IBM Plex Math"
description: "How to render LaTeX mathematical expressions offline using KaTeX delimiters and self-hosted IBM Plex Math typography."
date: 2026-08-24T12:00:00Z
author: "Architecture Team"
categories: ["Design System", "Typography"]
tags: ["Math", "KaTeX", "IBM Plex"]
version: "v11.2.0"
---

The **Hugo-Carbon Modular Engine** includes high-performance mathematical typesetting powered by self-hosted **KaTeX** and the open-source **IBM Plex Math** typeface. It executes 100% locally in browser memory without external CDN requests.

---

## 1. Mathematical Delimiters & Syntax

Mathematical formulas can be written using inline or display LaTeX syntax:

- **Inline Formulas**: Enclosed in `$ ... $` or `\( ... \)`
- **Display Block Formulas**: Enclosed in `$$ ... $$` or `\[ ... \]`

### Inline Math Examples
- The pythagorean theorem is $a^2 + b^2 = c^2$.
- The Euler-Lagrange equation is $\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{q}_i} \right) - \frac{\partial L}{\partial q_i} = 0$.
- Quantum wave function superposition: $|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$.

---

## 2. Advanced Mathematical Equations

### Maxwell's Equations of Electromagnetism
$$\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}, \quad \nabla \cdot \mathbf{B} = 0$$

$$\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}, \quad \nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \epsilon_0 \frac{\partial \mathbf{E}}{\partial t}$$

### Gaussian Integral & Normal Distribution
$$\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}$$

$$f(x \mid \mu, \sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left( -\frac{(x - \mu)^2}{2\sigma^2} \right)$$

### Linear Algebra: Eigenvalues & Matrices
$$\det(A - \lambda I) = 0$$

$$\begin{pmatrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
x\cos\theta - y\sin\theta \\
x\sin\theta + y\cos\theta
\end{pmatrix}$$

---

## 3. Advanced Equation Card (`math` Shortcode)

For complex equations with title bars and copy buttons, the engine provides the `math` shortcode:

{{< math title="Standard Model Lagrangian" label="eq:lagrangian" >}}
\mathcal{L} = -\frac{1}{4}F_{\mu\nu}F^{\mu\nu} + i\bar{\psi}\gamma^\mu D_\mu \psi + \text{h.c.} + \psi_i y_{ij} \psi_j \phi + \text{h.c.} + |D_\mu \phi|^2 - V(\phi)
{{< /math >}}
