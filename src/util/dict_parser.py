#!/usr/bin/env python
# -*- coding: UTF-8 -*-


import argparse

def load_dictionary(f):
    longman = {}

    for line in f.readlines() :
        if line.startswith("#") :
            continue

        parts = line.split('\t')
        if not parts[0].isalpha():
            continue
        
        print(parts[0], parts[1], len(parts)) 
        break 

def main():
    filename = "/Users/wonjune.park/Downloads/stardict-longman-2.4.2/longman.txt"
    with open(filename) as f:
        load_dictionary(f)


if __name__ == "__main__":
    main()