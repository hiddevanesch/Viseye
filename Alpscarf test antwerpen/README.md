# Alpscarf

`D3-alpscarf` is a D3 package for visualizing AOI visits in augmented scarf plots.
The visualization is originally developed (but not limited) in the context of eye-tracking research.
Find more information about Alpscrf at [R-alpscarf](https://github.com/Chia-KaiYang/alpscarf) repository.

**NOTE: This project is still in development. The current version merely gives a *glimpse* of the kind of interaction in the tool.**

## Interact with Alpscarf

To experience how the interactive visualization work, here is a runnable web application on [bl.ocks.org](https://bl.ocks.org/Chia-KaiYang/raw/cd34f16fd1a9df27a13a59045bd40c4d/)

## Usage
At top there are three drop-down menus that allow users to specify visualization mode (e.g., alpscarf/traditional scarf/mountain only/valley only, unnormalized/normalized view, transition-/duration-focus mode).

On top of the visualization, there is a legend. Users can (de)select the AOIs of interest by clicking the key in the legend. The corresponding parts of all Alpscarf visualizations are also highlighted simultaneously. Users can click on Alpscarf to select/deselect the AOIs of interest, as well as panning (click-and-drag), zooming (spin the wheel), and displaying tooltips (hover over).

## How to cite

If you use Alpscarf in your research, we would appreciate if you can insert the following citation


> Chia-Kai Yang and Chat Wacharamanotham. 2018. Alpscarf: Augmenting Scarf Plots for Exploring Temporal Gaze Patterns. In Extended Abstracts of the 2018 CHI Conference on Human Factors in Computing Systems (CHI EA ’18). Association for Computing Machinery, New York, NY, USA, 1–6. DOI:https://doi.org/10.1145/3170427.3188490


In bibtex:

```
@inproceedings{10.1145/3170427.3188490,
author = {Yang, Chia-Kai and Wacharamanotham, Chat},
title = {Alpscarf: Augmenting Scarf Plots for Exploring Temporal Gaze Patterns},
year = {2018},
isbn = {9781450356213},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
url = {https://doi.org/10.1145/3170427.3188490},
doi = {10.1145/3170427.3188490},
booktitle = {Extended Abstracts of the 2018 CHI Conference on Human Factors in Computing Systems},
pages = {1–6},
numpages = {6},
keywords = {visualization, scarf plot, eye movement, transitions},
location = {Montreal QC, Canada},
series = {CHI EA ’18}
}
```

## See also

* Paper and video previews [Alpscarf website](https://chia-kaiyang.github.io/project/alpscarf/)
* R package of Alpscarf [R package](https://github.com/Chia-KaiYang/alpscarf)
