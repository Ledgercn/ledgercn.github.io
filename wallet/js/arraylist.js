function ArrayList()
{
    this.index = -1;
    this.array = new Array();
}

ArrayList.prototype.clear = function() {
    this.index = -1;
    this.array = new Array();
};

ArrayList.prototype.add = function(obj) {
    if (this.getIndex(obj) == -1)
    {
        this.index = this.index + 1;
        this.array[eval(this.index)] = obj;
    }
};

ArrayList.prototype.set = function(al) {
    this.clear();
    if (al != null){
        this.array = al;
        this.index = this.array.length - 1;
    }
};

ArrayList.prototype.get = function(index) {
    return this.array[eval(index)];
};

ArrayList.prototype.getArray = function(){
    return this.array;
};

ArrayList.prototype.size = function() {
    return this.index + 1;
};

ArrayList.prototype.getIndex = function(obj) {
    var index = -1;
    for (var i = 0; i < this.array.length; i++)
    {
        if (this.array[i] == obj)
        {
            index = i;
            break;
        }
    }
    return index;
};

ArrayList.prototype.remove = function(index) {
    var j = 0;
    var arrThis = this.array;
    var arrTemp = new Array();
    for (w = 0; w < arrThis.length; w++)
    {
        if (eval(index) != eval(w))
        {
            arrTemp[j] = arrThis[w];
            j++;
        }
    }
    this.array = arrTemp;
    this.index = eval(j - 1);
};

ArrayList.prototype.removeValue = function(obj) {
    var j = 0;
    var arrThis = this.array;
    var arrTemp = new Array();
    for (w = 0; w < arrThis.length; w++)
    {
        if (obj != arrThis[w])
        {
            arrTemp[j] = arrThis[w];
            j++;
        }
    }
    this.array = arrTemp;
    this.index = eval(j - 1);
};

ArrayList.prototype.toString = function() {
    var strResult = angular.toJson(this.array,false);
    return strResult;
};
 